const fs = require('fs')
const path = require('path')

const usersFilePath = path.join(__dirname, '../../config/users.json')

function loadUsers() {
  try {
    const raw = fs.readFileSync(usersFilePath, 'utf-8')
    const data = JSON.parse(raw)

    if (Array.isArray(data)) {
      return data
    }

    if (Array.isArray(data?.users)) {
      return data.users
    }
  } catch (error) {
    console.error('Failed to load users configuration', error)
  }

  return []
}

function findUser(username) {
  if (!username) {
    return undefined
  }

  const users = loadUsers()
  return users.find((entry) => entry.username === username)
}

module.exports = {
  findUser,
}

