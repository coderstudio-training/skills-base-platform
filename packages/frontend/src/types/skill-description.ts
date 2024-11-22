import { SkillDetail } from './admin';

export const skillDescriptions: Record<string, string> = {
  Budgeting:
    'Preparing organizational budgets to support short- and long-term business plans through forecasting, allocation and financial policy setting',
  'Process Validation':
    'Verify that processes are reproducible and consistent in delivering quality products according to specifications, and in line with international regulations',
  'Software Testing':
    'Assess and test the overall effectiveness and performance of an application, involving the setting up of suitable testing conditions, definition of test cases and/or technical criteria',
  'Quality Standards':
    'Develop, review and communicate a clear, quality expectations and standards within an organization that are aligned to the companys values and business objectives. This encompasses the setting and implementation of quality expectations for IT products and services delivered to both internal or external clients',
  'Test Planning':
    'Develop a test strategy and systematic test procedures to verify and ensure that a product, system or technical solution meets its design specifications as well as the performance, load and volume levels set out. This includes the ability to define when different requirements will be verified across the product life stages, the tools used to perform the test, the data and/or resources needed to conduct the tests and testware in test cases, test scripts, test reports and test plans required',
  'Strategy Implementation':
    'Execute and implement operational and tactical-level action plans in alignment with the organizations business strategies',
  'Failure Analysis':
    'Examine the electrical and physical defects evidence to verify the causes of failure as well as identify the failure modes',
  'Partnership Management':
    'Build cooperative partnerships with inter-organizational and external stakeholders and leveraging of relations to meet organizational objectives. This includes coordination and strategizing with internal and external stakeholders through close cooperation and exchange of information to solve problems',
  'Process Improvement and Optimization':
    'Establish systems to discover critical processes and maximize these processes to achieve maximum efficiency in accordance with organization procedures',
  'Quality Engineering':
    'Create, deploy and maintain quality-related systems, processes and tools to establish an environment that supports process and product quality',
  'Agile Software Development ':
    'Plan and implement Agile methodology and the use of adaptive and iterative methods and techniques in the software development lifecycle to account for continuous evolution, development, and deployment to enable seamless delivery of the application to the end user',
  'Software Design':
    'Create and refine the overall plan for the design of software, including the design of functional specifications starting from the defined business requirements as well as the consideration and incorporation of various controls, functionality and interoperability of different elements into a design blueprint or model which describes the overall architecture in hardware, software, databases, and third party frameworks that the software will use or interact with',
  'Project Management':
    'Perform planning, organization, monitoring and control of all aspects of an IT program and the strategic utilization of resources to achieve the objectives within the agreed timelines, costs and performance expectations. In addition, the identification, coordination and management of project interdependencies, ensuring alignment with and achievement of business objectives',
  'Networking ':
    'Identifying, evaluating and strategizing to seize new business opportunities to grow the organizations business operations.',
  'Business Needs Analysis':
    'Identify and scope business requirements and priorities through rigorous information gathering and analysis as well as clarification of the solutions, initiatives and programs to enable effective delivery. This also involves the development of a compelling and defensible business case and the articulation of the potential impact of the solution to the business',
  'Problem Management':
    'Manage the lifecycle of problems to prevent problems and incidents from occurring, eliminate recurring incidents and minimize impact of unavoidable incidents',
  'Applications Development':
    'Develop applications based on the design specifications; encompassing coding, testing, debugging, documenting and reviewing and/or refining it across the application development stages in accordance with defined standards for development and security. The complexity of the application may range from a basic application to a context-aware and/or augmented reality application that incorporates predictive behavior analytics, geo-spatial capabilities and other appropriate algorithms. The technical skill includes the analysis and possibly the reuse, improvement, reconfiguration, addition or integration of existing and/or new application components.',
  'Stakeholder Management':
    'Manage stakeholder expectations and needs by aligning those with requirements and objectives of the organization. This involves planning of actions to effectively communicate with, negotiate with and influence stakeholders',
  'Business Performance Management':
    'Implement organizational performance systems to meet business plans and objectives by establishing performance indicators, tracking progress and addressing gaps',
};

export const getSkillDescription = (skill: SkillDetail): string => {
  return skillDescriptions[skill.skill] || 'No specific description available.';
};
