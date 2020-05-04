module.exports = {
    entry: {
        AccCreation: './src/accountCreation.js',
        addWebsiteAccount: './src/addWebsiteAccount.js',
        background: './src/background.js',
        content: './src/content.js',
        deleteAccount: './src/deleteAccount.js',
        index: './src/index.js',
        settings: './src/settings.js',
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/PWMAN/Scripts'
    }
};