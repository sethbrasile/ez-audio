import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  plugins: {
    tsdoc: {
      enabled: true,
      parser: 'eslint-plugin-tsdoc',
    },
  },
})
