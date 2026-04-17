module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'jira-key-in-scope': (parsed) => {
          const { scope } = parsed;
          const jiraRegex = /^SN-\d+$/;

          if (!scope) {
            return [
              false,
              'Commit must have Jira Key in scope (Ex: feat(SN-1): ...)',
            ];
          }

          if (!jiraRegex.test(scope)) {
            return [
              false,
              `Scope "${scope}" is invalid. Expected format: SN-1`,
            ];
          }

          return [true];
        },
      },
    },
  ],
  rules: {
    'scope-case': [0],
    'scope-empty': [2, 'never'],
    'jira-key-in-scope': [2, 'always'],
  },
};
