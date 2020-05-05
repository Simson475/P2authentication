module.exports = {
    entry: {
        AccCreation: './src/accountCreation.js',
        addWebsiteAccount: './src/addWebsiteAccount.js',
        background: './src/background.js',
        content: './src/content.js',
        index: './src/index.js',
        settings: './src/settings.js',
        import: './src/import.js',
        export: './src/export.js',
        deleteAccount: './src/deleteAccount.js'
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/PWMAN/Scripts'
    }
};