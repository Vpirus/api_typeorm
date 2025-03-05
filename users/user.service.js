const bcrypt = require('bcryptjs');
const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { email: params.email } })) {
        throw `Email "${params.email}" is already registered`;
    }

    const user = new db.User(params);

    // Hash password
    if (params.password) {
        user.passwordHash = bcrypt.hashSync(params.password, 10);
    }

    // Save user
    await user.save();
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    if (params.email && params.email !== user.email) {
        if (await db.User.findOne({ where: { email: params.email } })) {
            throw `Email "${params.email}" is already taken`;
        }
    }

    // Hash password if it was entered
    if (params.password) {
        params.passwordHash = bcrypt.hashSync(params.password, 10);
    }

    // Copy params to user and save
    Object.assign(user, params);
    await user.save();
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// Helper function
async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}
