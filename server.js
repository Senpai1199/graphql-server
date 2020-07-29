const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLScalarType
} = require("graphql")

const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' }
]

const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2 },
    { id: 6, name: 'The Return of the King', authorId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const app = express()

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represents a author of a book",
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLInt),
        },
        name: {
            type: GraphQLNonNull(GraphQLString),
        },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This represents a book written by an author",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLString },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const rootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
        book: {
            type: BookType,
            description: 'A single book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                return books.find(book => book.id === args.id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of Books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of Authors",
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: "A single author",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                return authors.find(author => author.id === args.id)
            }
        }
    })
})

const rootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add a new book",
            args: {
                name: {
                    type: GraphQLNonNull(GraphQLString)
                },
                authorId: {
                    type: GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, authorId: args.authorId, name: args.name }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "Add a new author",
            args: {
                name: {
                    type: GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name }
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: rootQueryType,
    mutation: rootMutationType
})

app.use('/graphql', graphqlHTTP({
    graphiql: true,
    schema
}))

app.listen(5000, () => console.log("Server started"))