import antfu from '@antfu/eslint-config'

export default antfu({
  plugins: {
    tsdoc: {
      enabled: true,
      parser: 'eslint-plugin-tsdoc',
    }
  },
})
