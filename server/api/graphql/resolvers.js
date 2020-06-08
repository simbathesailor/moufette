const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Team = require('../models/team')
const FeedbackService = require('../services/FeedbackService')
const UserService = require('../services/UserService')
const FeatureService = require('../services/FeatureService')
const PersonService = require('../services/PersonService')

const resolvers = {
   Feature: {
      myVote(feature, args, ctx) {
         return FeatureService.myVote(feature, ctx)
      }
   },
   Feedback: {
      person({ person }) {
         return PersonService.findOneById(person)
      }
   },
   User: {
      team({ team }) {
         return Team.findOne({ _id: team })
      }
   },
   Team: {
      integrations({ integrations }) {
         const filtered = { ...integrations }
         Object.keys(filtered).forEach(k => filtered[k] = true)
         return filtered
      }
   },
   Query: {
      currentUser: (parent, args, context) => context.getUser(),
      feedbacks: (parent, args, context) => FeedbackService.findAll(),
      widget: (parent, args, context) => UserService.getConfig(context),
      features: (parent, args, context) => FeatureService.findFeatures(context),
   },
   Mutation: {
      vote(_, args, ctx) {
         return FeatureService.vote(args, ctx);
      },
      feedback(_, args, ctx) {
         return FeedbackService.recordFeedback(args, ctx);
      },
      signup: async (parent, { companyName, firstName, lastName, email, password }, context) => {
         // const existingUsers = context.User.getUsers();

         // TODO how to block other sign ups
         if (process.env.MULTIPLE_TEAMS !== "true" && !!(await User.findOne())) {
            throw new Error("An admin already exists. Please contact them")
         }

         const userWithEmailAlreadyExists = !!(await User.findOne({ email }))

         if (userWithEmailAlreadyExists) {
            throw new Error('User with email already exists');
         }

         const team = await Team.create({
            name: companyName,
         })

         const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            team: team._id
         });

         // TODO check 
         // https://github.com/encrypted-dev/userbase/blob/e443ae07de47262d0e468f461a7cdd472123269c/src/userbase-server/admin.js#L1161
         const token = jwt.sign({}, process.env.JWT_SECRET, {
            algorithm: 'HS256',
         })
         // console.log('token:', token)

         await team.update({ $addToSet: { members: user._id }, token })

         context.login(user);

         return { user };
      },
      login: async (parent, { email, password }, context) => {
         const { user } = await context.authenticate('graphql-local', { email, password });
         context.login(user);
         return { user }
      },
      forgotPassword: async (_, args, ctx) => {
         return UserService.forgotPassword(args, ctx)
      },
      resetPassword: async (_, args, ctx) => {
         return UserService.resetPassword(args, ctx)
      },
      logout: (parent, args, context) => context.logout(),
      updateWidget: (parent, args, ctx) => UserService.updateWidget(args, ctx),
      updateFeature: (parent, args, ctx) => FeatureService.updateFeature(args, ctx),

      // integratinos
      connectSlack: (parent, args, ctx) => UserService.connectSlack(args, ctx),
   },
};

module.exports = resolvers;