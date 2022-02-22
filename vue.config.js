module.exports = {
    lintOnSave: false, // disable esLint
    publicPath: process.env.NODE_ENV === 'production'
        ? '/eTyper/'
        : '/'
};