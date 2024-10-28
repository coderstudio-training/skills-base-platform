module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'user-service',
        'skills-service',
        'learning-service',
        'integration-service',
        'email-service',
        'event-processes-service',
        'frontend',
        'shared',
        'deps'
      ]
    ]
  }
};
