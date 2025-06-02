import React from "react";

const Home = React.lazy(() => import("../Pages/Home"));
const ContentCreation = React.lazy(() => import("../Pages/ContentCreation"));
const EmailGeneration = React.lazy(() => import("../Pages/EmailGeneration"));
const Auth = React.lazy(() => import("../Pages/Auth/index"));

// const ContactUs = React.lazy(() => import('../pages/Contact'));
// const AboutUs = React.lazy(() => import('../pages/About'));
// const Pricing = React.lazy(() => import('../pages/Pricing'));
// const OurServices = React.lazy(() => import('../pages/OurServices'));
// const MarketingPage = React.lazy(() => import('../pages/OurServices/Marketing'));
// const ManagedServices = React.lazy(() => import('../pages/OurServices/ManagedServices'));
// const Automation = React.lazy(() => import('../pages/OurServices/Automation'));
// const Terms = React.lazy(() => import('../pages/Terms/terms'));
// const VirtualAssistantProgram = React.lazy(
//   () => import('../pages/OurServices/VirtualAssistantProgram')
// );

export const R_Home = "/";
export const R_Content_Creation = "/content";
export const R_Email_Generation = "/email-generator";
export const R_auth = "/auth/:id";

// export const R_Contact_Us = '/contact-us';
// export const R_About_Us = '/about-us';
// export const R_Pricing = '/pricing';
// export const R_Our_Services = '/our-services';
// export const R_Marketing = 'marketing';
// export const R_Managed_Servcies = 'managed-services';
// export const R_Automation = 'automation';
// export const R_Virtual_Assistant_Program = 'virtual-assistant-program';
// export const R_Terms = '/terms';




export const PublicRoutes = [
  {
    key: "auth",
    title: "Auth Page",
    path: R_auth,
    component: Auth,
  },
];

export const PrivateRoutes = [
  {
    key: "home",
    title: "Home Page",
    path: R_Home,
    component: Home,
  },
  {
    key: "content_creation",
    title: "Content Creation Page",
    path: R_Content_Creation,
    component: ContentCreation,
  },
  {
    key: "email_generation",
    title: "Email Generation Page",
    path: R_Email_Generation,
    component: EmailGeneration,
  },
];
