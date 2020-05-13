const { GraphQLServer } = require('graphql-yoga')
const { Prisma, forwardTo } = require('prisma-binding')

const resolvers = {
  Query: {
    posts: (_, args, context, info) => {
      return context.prisma.query.posts(
        {
          where: {
            OR: [
              { title_contains: args.searchString },
              { content_contains: args.searchString },
            ],
          },
        },
        info,
      )
    },
    user: (_, args, context, info) => {
      return context.prisma.query.user(
        {
          where: {
            id: args.id,
          },
        },
        info,
      )
    },
    users: forwardTo('prisma'),
    allCategories: (_, args, context, info) => {
      return context.prisma.query.categories(
        {},
        info,
      )
    },
  },
  Mutation: {
    createDraft: (_, args, context, info) => {
      return context.prisma.mutation.createPost(
        {
          data: {
            title: args.title,
            content: args.content,
            author: {
              connect: {
                id: args.authorId,
              },
            },
          },
        },
        info,
      )
    },
    publish: (_, args, context, info) => {
      return context.prisma.mutation.updatePost(
        {
          where: {
            id: args.id,
          },
          data: {
            published: true,
          },
        },
        info,
      )
    },
    deletePost: (_, args, context, info) => {
      return context.prisma.mutation.deletePost(
        {
          where: {
            id: args.id,
          },
        },
        info,
      )
    },
    signup: (_, args, context, info) => {
      return context.prisma.mutation.createUser(
        {
          data: {
            name: args.name,
            email: args.email
          },
        },
        info,
      )
    },
    updateBio: (_, args, context, info) => {
      return context.prisma.mutation.updateUser(
        {
          data: {
            profile: {
              update: { bio: args.bio }
            }
          },
          where: { id: args.userId }
        },
        info,
      )
    },
    addPostToCategories: (_, args, context, info) => {
      const ids = args.categoryIds.map(id => ({ id }))
      console.log(args, ids)
      return context.prisma.mutation.updatePost(
        {
          data: {
            categories: {
              connect: ids
            }
          },
          where: {
            id: args.postId
          }
        },
        info,
      )
    },
  },
}

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'http://localhost:4466',
    }),
  }),
})
server.start(() => console.log(`GraphQL server is running on http://localhost:4000`))