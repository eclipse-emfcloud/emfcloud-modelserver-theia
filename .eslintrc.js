/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    extends: ['./configs/base.eslintrc.json'],
    ignorePatterns: ['**/{node_modules,lib}'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.eslint.json'
    },
    overrides: [
        {
            files: ['*.spec.ts'],
            rules: {
                'no-unused-expressions': 0,
                'no-invalid-this': 0
            }
        }
    ]
};
