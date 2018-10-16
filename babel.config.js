module.exports = {
  presets: [
    ['@babel/env', {targets: {node: '6'}}],
  ],
  plugins: [
    ['@babel/proposal-pipeline-operator', {proposal: 'minimal'}]
  ],
  comments: false
}
