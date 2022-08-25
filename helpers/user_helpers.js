let db = require('../database/connection')
let collection = require('../database/collection')
let bcrypt = require('bcrypt')
let objectId = require("mongodb").ObjectId;

getCount = async (credential, collection) => {
    return await db.get().collection(collection).find(credential).count()
}

isPasswordExist = async (password) => {
    return new Promise(async (resolve, reject) => {
        let exist = false
        let documents = await db.get().collection(collection.USERS).find().toArray()

        for (let element = 0; element < documents.length; element++) {
            if (await bcrypt.compare(password, documents[element].password)) {
                exist = true
                break;
            }
        }
        resolve(exist)
    })
}

module.exports = {
    doSignUp: (userDetails) => {
        for (var key in userDetails) {
            if (typeof userDetails[key] === 'string') {
                userDetails[key] = userDetails[key].trimEnd()
            }
        }
        return new Promise(async (resolve, reject) => {

            let usersCollection = db.get().collection(collection.USERS)

            if (await getCount({ user_name: userDetails.user_name }, collection.USERS) != 0)
                reject("Username already exist")
            else if (await getCount({ email_address: userDetails.email_address }, collection.USERS) != 0)
                reject("Already have account in this email")
            else if (await isPasswordExist(userDetails.password) == true)
                reject("Password already exist")
            else {
                userDetails.password = await bcrypt.hash(userDetails.password, 10);
                usersCollection.insertOne(userDetails).then((signUp) => {
                    resolve(signUp.insertedId)
                })
            }

        })
    },

    doLogin: (loginData) => {
        return new Promise(async (resolve, reject) => {
            let usersCollection = db.get().collection(collection.USERS)
            let user = await usersCollection.findOne({
                $or: [
                    { email_address: loginData.email_or_username },
                    { user_name: loginData.email_or_username }
                ]
            })

            if (user) {
                if (await bcrypt.compare(loginData.password, user.password)) {
                    delete user.password;
                    resolve(user)
                } else {
                    reject("Invalid Password")
                }
            } else {
                reject("Invalid email or username")
            }

        })
    },

    getAllusers: (localUser) => {
        return new Promise(async (resolve, reject) => {
            let usersCollection = db.get().collection(collection.USERS)
            allUsers = await usersCollection.aggregate(
                [
                    {
                        $match: { _id: { $not: { $eq: objectId(localUser) } } }
                    },
                    {
                        $unset: "password"
                    },
                    {
                        $lookup: {
                            from: collection.MESSAGES,
                            let: { id: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $in: ["$$id", "$chats"] },
                                                { $in: [objectId(localUser), "$chats"] }
                                            ]
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        messages: {
                                            $arrayElemAt: ['$messages', -1]
                                        },
                                    }
                                }
                            ],
                            as: "last_message"
                        }
                    },
                    {
                        $set: {
                            last_message: {
                                $arrayElemAt: ['$last_message', 0]
                            }
                        }
                    },
                    {
                        $set: {
                            last_message: {
                                messages: '$last_message.messages.message',
                                recieved_date: '$last_message.messages.sent_time'
                            }
                        }
                    }
                ]
            ).toArray()

            if (allUsers.length > 0)
                resolve(allUsers)
            else
                reject()
        })
    },

    get_single_chat: (chat_id, user_id) => {

        return new Promise(async (resolve, reject) => {
            let usersCollection = db.get().collection(collection.USERS)
            let messagesCollection = db.get().collection(collection.MESSAGES)
            let link = {
                chats: [objectId(chat_id), objectId(user_id.toLowerCase())]
            }

            let messages = await messagesCollection.findOne({ chats: { $all: [objectId(chat_id), objectId(user_id.toLowerCase())] } })

            if (!messages) {
                messagesCollection.insertOne(link)
            }

            let chat = await usersCollection.aggregate([
                {
                    $match: { _id: objectId(chat_id) }
                },
                {
                    $lookup: {
                        from: collection.MESSAGES,
                        pipeline: [
                            {
                                $match: {
                                    chats: { $all: [objectId(chat_id), objectId(user_id.toLowerCase())] }
                                }
                            },
                        ],
                        as: 'chat'
                    }
                },
                {
                    $project: {
                        user_name: 1,
                        email_address: 1,
                        profile_picture: 1,
                        chat: { $arrayElemAt: ["$chat", 0] }
                    }
                }
            ]).toArray()

            resolve(chat[0])

        })
    },
    save_message: (message_detalils) => {
        return new Promise(async (resolve, reject) => {
            let message = {
                message: message_detalils['message[message]'],
                sent_by: objectId(message_detalils['message[sent_by]']),
                recieved_by: objectId(message_detalils['message[recieved_by]']),
                sent_time: Date(message_detalils['message[sent_time]'])
            }
            let messagesCollection = db.get().collection(collection.MESSAGES)
            messagesCollection.updateOne(
                {
                    _id: objectId(message_detalils.chat_common_id)
                },
                {
                    $push: { messages: message }
                })
        })
    }
}