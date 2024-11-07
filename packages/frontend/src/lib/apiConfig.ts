export const apiConfig = {
  microservices: {
    userService: { baseUrl: process.env.USER_SERVICE_URL },
    skillsService: { baseUrl: process.env.PRODUCT_SERVICE_URL },
    learningService: {},
    eventProcessService: {},
    emailService: {},
  },
};
