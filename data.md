```javascript
let data = {
  users: [
    {
      userId: 1,
      nameFirst: 'Rani',
      nameLast: 'Jiang',
      email: 'ranivorous@gmail.com',
      password: 'paswswo$^%&prof2',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,

    },
    {
      userId: 2,
      nameFirst: 'Oliver',
      nameLast: 'Brown',
      email: 'oliverbrown@gmail.com',
      password: 'olvier@#%23o847',
      numSuccessfulLogins: 4,
      numFailedPasswordsSinceLastLogin: 2,
    }
  ],

  quizzes: [
    {
      quizId: 1,
      authUserId: 1,
      playerIds: [3],
      name: 'My Quiz',
      description: 'This is my quiz (made by Rani and Oliver)',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871, 
      quizContents: [
        {
          questionNumber: 1,
          writerId: 2,
          questionDescription: "written by Oliver",
          questionText: 'Who was the first President of the United States?',
          options: [
            {
              optionId: 1,
              optionText: 'George Washington',
              isCorrect: true
            },
            {
              optionId: 2,
              optionText: 'Thomas Jefferson',
              isCorrect: false
            },
            {
              optionId: 3,
              optionText: 'Abraham Lincoln',
              isCorrect: false
            }
          ]
        }
      ],
      scores: [
        {
          userId: 3,
          score: 0
        }
      ]
    },
    {
      quizId: 2,
      authUserId: 1, 
      playerIds: [3],
      name: 'My Quiz 2',
      description: 'This is my 2nd quiz (also made by Rani and Oliver)',
      timeCreated: 83471,
      timeLastEdited: 123, 
      quizContents: [
        {
          questionNumber: 1,
          writerId: 2,
          questionDescription: 'written by Rani',
          questionText: 'What is the capital of France?',
          options: [
            {
              optionId: 1,
              optionText: 'London',
              isCorrect: false
            },
            {
              optionId: 2,
              optionText: 'Berlin',
              isCorrect: false
            },
            {
              optionId: 3,
              optionText: 'Madrid',
              isCorrect: false
            },
            {
              optionId: 4,
              optionText: 'Paris',
              isCorrect: true
            }
          ]
        }
      ]
      scores: [
        {
          userId: 3,
          score: 0
        }
      ]
    }
  ]
};

```
