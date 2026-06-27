import nextVitals from "eslint-config-next/core-web-vitals"

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [".next/**", ".open-next/**", "node_modules/**", "src/payload-types.ts"],
  },
]

export default eslintConfig
