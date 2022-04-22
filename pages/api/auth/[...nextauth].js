import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import dbConnect from "../../../lib/dbConnect";
import Users from "../../../models/userModel";
import { html, text } from "../../../lib/htmlEmail";
import nodemailer from "nodemailer";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const options = {
  session: {
    jwt: true,
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,

      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        const { host } = new URL(url);
        //const transport = nodemailer.createTransport(server);
        var transport = nodemailer.createTransport({
          host: "smtp.gmail.com", // hostname
          secure: false, // use SSL
          port: 25, // port for secure SMTP
          auth: {
            user: process.env.EMAIL_SENDER,
            pass: process.env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        await transport.sendMail({
          service: "Gmail",
          to: email,
          from,
          subject: `Sign in to ${host}`,
          text: text({ url, host }),
          html: html({ url, host, email }),
        });
      },
    }),
    /*CredentialsProvider({
      name: "Credentials",
      async authorize(credentials, req) {
        await dbConnect();

        const email = credentials.email;
        const password = credentials.password;

        const user = await Users.findOne({ email });
        if (user) return loginUser({ password, user });

        return registerUser({ email, password });
      },
    }),*/
  ],
  adapter: MongoDBAdapter(clientPromise),
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
    newUser: "/auth/new-user",
  },
  //secret: process.env.SECRET,
  callbacks: {
    session: async ({ session, token, user, pro }) => {
      if (session?.user) {
        session.user.userId = user.id;
      }

      return Promise.resolve(session);
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
};

const loginUser = async ({ password, user }) => {
  if (!user.password) {
    throw new Error("Accounts have to login with OAuth or Email.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Incorrect password.");
  }

  if (!user.emailVerified) {
    throw new Error("Email not verified yet");
  }

  return user;
};

const registerUser = async ({ email, password }) => {
  const hashPass = await bcrypt.hash(password, 12);

  const newUser = new Users({ email, password: hashPass });
  await newUser.save();
  signIn("email", { email });

  throw new Error("Success");
};

export default (req, res) => NextAuth(req, res, options);
