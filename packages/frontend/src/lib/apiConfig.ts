export const apiConfig = {
  microservices: {
    userService: { baseUrl: process.env.USER_SERVICE_URL },
    skillsService: { baseUrl: process.env.SKILLS_SERVICE_URL },
    learningService: { baseUrl: process.env.LEARNING_SERVICE_URL },
    eventProcessService: { baseUrl: process.env.EVENT_PROCESS_SERVICE_URL },
    emailService: { baseUrl: process.env.EMAIL_SERVICE_URL },
  },
};
