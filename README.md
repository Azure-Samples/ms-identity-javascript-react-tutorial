---
page_type: sample
languages:
- javascript
products:
- msal-react
- ms-graph
- azure-storage
- azure-app-service
- azure-functions
- azure-resource-manager
- azure-app-service-static
- azure-active-directory
- azure-active-directory-b2c
description: "Tutorial: Enable your React single-page application to sign-in users, call the Graph API and deploy on Azure"
urlFragment: "ms-identity-javascript-react-tutorial"
---

# Tutorial: Enable your React single-page application to sign-in users and call APIs with the Microsoft identity platform

[![Build](https://github.com/Azure-Samples/ms-identity-javascript-react-tutorial/actions/workflows/node.js.yml/badge.svg)](https://github.com/Azure-Samples/ms-identity-javascript-react-tutorial/actions/workflows/node.js.yml)
[![Code Scan](https://github.com/Azure-Samples/ms-identity-javascript-react-tutorial/actions/workflows/codeql.yml/badge.svg)](https://github.com/Azure-Samples/ms-identity-javascript-react-tutorial/actions/workflows/codeql.yml)
![GitHub issues](https://img.shields.io/github/issues/Azure-Samples/ms-identity-javascript-react-tutorial)
![npm](https://img.shields.io/npm/v/@azure/msal-browser?label=msal-browser)
![npm](https://img.shields.io/npm/v/@azure/msal-react?label=msal-react)
![GitHub](https://img.shields.io/github/license/Azure-Samples/ms-identity-javascript-react-tutorial)

The [Microsoft identity platform](https://docs.microsoft.com/azure/active-directory/develop/v2-overview), along with [Azure Active Directory](https://docs.microsoft.com/azure/active-directory/fundamentals/active-directory-whatis) (Azure AD) and [Azure Azure Active Directory B2C](https://docs.microsoft.com/azure/active-directory-b2c/overview) (Azure AD B2C) are central to the **Azure** cloud ecosystem. This tutorial aims to take you through the fundamentals of modern authentication with React, using the [Microsoft Authentication Library for React](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react) (MSAL React).

We recommend following the chapters in successive order. However, the code samples are self-contained, so feel free to pick samples by topics that you may need at the moment.

> :warning: This is a *work in progress*. Come back frequently to discover more samples.

> :information_source: Samples in this tutorial use functional React components. If you want to use MSAL React with class-based React components, see: [Docs: Class Components](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/class-components.md)

## Prerequisites

- [Node.js v14 LTS or later](https://nodejs.org/en/download/)
- [Visual Studio Code](https://code.visualstudio.com/download)
- A modern web browser (to use [popup experience](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md#choosing-an-interaction-type) during sign-in and token acquisition, your browser should allow popups.)

Please refer to each sample's README for sample-specific prerequisites.

## Recommendations

- [jwt.ms](https://jwt.ms) for inspecting your tokens
- [Fiddler](https://www.telerik.com/fiddler) for monitoring your network activity and troubleshooting
- Check [MSAL.js FAQ](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/FAQ.md) and [MSAL React FAQ](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/FAQ.md) for your questions
- Follow the [Azure AD Blog](https://techcommunity.microsoft.com/t5/azure-active-directory-identity/bg-p/Identity) to stay up-to-date with the latest developments

Please refer to each sample's README for sample-specific recommendations.

## Contents

- For **Azure AD**, start the tutorial from [here](./1-Authentication/1-sign-in/README-incremental.md)
- For **Azure AD B2C**, start the tutorial from [here](./1-Authentication/2-sign-in-b2c/README-incremental.md)

Alternatively, choose below the sample you want to review.

### Chapter 1: Sign-in a user to your application

|               |               |
|---------------|---------------|
| <img src="./1-Authentication/1-sign-in/ReadmeFiles/topology.png" width="200"> | [**Sign-in with Azure AD**](./1-Authentication/1-sign-in/README.md) </br> Sign-in your users with the **Azure AD** and learn to work with **ID Tokens**. Learn how **single sign-on (SSO)** works. Learn to secure your apps to operate in **national clouds**.|
| <img src="./1-Authentication/2-sign-in-b2c/ReadmeFiles/topology.png" width="200"> | [**Sign-in with Azure AD B2C**](./1-Authentication/2-sign-in-b2c/README.md) </br> Sign-in your customers with **Azure AD B2C**. Learn to integrate with **external social identity providers**. Learn how to use **user-flows** and **custom policies**. |

### Chapter 2: Sign-in a user and get an Access Token for Microsoft Graph

|                |               |
|----------------|---------------|
| <img src="./2-Authorization-I/1-call-graph/ReadmeFiles/topology.png" width="200"> | [**Get an Access Token from Azure AD and call Microsoft Graph**](./2-Authorization-I/1-call-graph/README.md) </br> Authenticate your users and acquire an **Access Token** for Microsoft Graph and then call the **Microsoft Graph API**. Handle Continous Access Evaluation (CAE) events. |
| <img src="./2-Authorization-I/2-call-arm/ReadmeFiles/topology.png" width="200"> | [**Get an Access Token from Azure AD and call Azure REST API and Azure Storage REST API**](./2-Authorization-I/2-call-arm/README.md) </br> Authenticate your users and acquire an **Access Token** for Azure Management Resource and Azure Storage then call the **Azure REST API** and **Azure Storage REST API**.|

### Chapter 3: Protect an API and call the API from your client app

|                 |               |
|-----------------|---------------|
| <img src="./3-Authorization-II/1-call-api/ReadmeFiles/topology.png" width="200"> | [**Protect and call a web API on Azure AD**](./3-Authorization-II/1-call-api/README.md) </br> Protect your web API with the **Azure AD**. Use a client application to sign-in a user, acquire an **Access Token** for your web API and call your protected web API. |
| <img src="./3-Authorization-II/2-call-api-b2c/ReadmeFiles/topology.png" width="200"> | [**Protect and call a web API on Azure AD B2C**](./3-Authorization-II/2-call-api-b2c/README.md) </br> Protect your web API with **Azure AD B2C**. Use a client application to sign-in a user, acquire an **Access Token** for your web API and call your protected web API. |

### Chapter 4: Deploy your application to Azure

|                 |               |
|-----------------|---------------|
| <img src="./4-Deployment/2-deploy-static/ReadmeFiles/topology.png" width="280"> | [**Deploy to Azure Static Web Apps**](./4-Deployment/2-deploy-static/README.md) </br> Prepare your app for deployment to Azure Static Web Apps. Learn how to protect and call an **Azure Function** API. Learn how to configure authentication parameters and use **Azure** services for managing your operations. |

### Chapter 5: Control access to your protected API using App Roles and Security Groups

|                 |               |
|-----------------|---------------|
| <img src="./5-AccessControl/1-call-api-roles/ReadmeFiles/topology.png" width="200"> | [**Use App Roles for access control**](./5-AccessControl/1-call-api-roles/README.md) </br> Define App Roles and use roles claim in a token to implement Role-based Access Control (RBAC) for your SPA and protected web API. |
| <img src="./5-AccessControl/2-call-api-groups/ReadmeFiles/topology.png" width="200"> | [**Use Security Groups for access control**](/5-AccessControl/2-call-api-groups/README.md) </br> Create Security Groups and use groups claim in a token to implement Role-based Access Control (RBAC) for your SPA and protected web API. Handle overage scenarios.  |

### Chapter 6: Dive into advanced scenarios

|                 |               |
|-----------------|---------------|
| <img src="./6-AdvancedScenarios/1-call-api-obo/ReadmeFiles/topology.png" width="200"> | [**Call a web API that calls Microsoft Graph on behalf of a user**](./6-AdvancedScenarios/1-call-api-obo/README.md) </br> Enhance your protected web API to acquire an **Access Token** for Microsoft Graph **on-behalf-of** a user signed-in to the client app. Enable **Conditional Access** for your downstream API and handle **MFA** requirement. |
| <img src="./6-AdvancedScenarios/3-call-api-acrs/ReadmeFiles/topology.png" width="200"> | [**Use Conditional Access Authentication Context**](./6-AdvancedScenarios/3-call-api-acrs/README.md) </br> Enable conditional access for your web API. Use auth context to implement granular access control to resources. Handle claims challenge in client applications. |
| <img src="./6-AdvancedScenarios/4-sign-in-hybrid/ReadmeFiles/Images/topology.png" width="200"> | [**Use the hybrid SPA flow to authenticate users on both server-side and client-side applications**](./6-AdvancedScenarios/4-sign-in-hybrid/README.md) </br> Authenticate users both server side and client side. Use hybrid SPA flow to achieve SSO between backend and frontend applications. |

## We'd love your feedback

Were we successful in addressing your learning objective? Consider taking a moment to [share your experience with us](https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR73pcsbpbxNJuZCMKN0lURpUMlRHSkc5U1NLUkxFNEtVN0dEOTFNQkdTWiQlQCN0PWcu).

## More information

Learn more about the **Microsoft identity platform**:

- [Microsoft identity platform](https://docs.microsoft.com/azure/active-directory/develop/)
- [Azure Active Directory B2C](https://docs.microsoft.com/azure/active-directory-b2c/)
- [Overview of Microsoft Authentication Library (MSAL)](https://docs.microsoft.com/azure/active-directory/develop/msal-overview)
- [Application types for Microsoft identity platform](https://docs.microsoft.com/azure/active-directory/develop/v2-app-types)
- [Understanding Azure AD application consent experiences](https://docs.microsoft.com/azure/active-directory/develop/application-consent-experience)
- [Understand user and admin consent](https://docs.microsoft.com/azure/active-directory/develop/howto-convert-app-to-be-multi-tenant#understand-user-and-admin-consent)
- [Application and service principal objects in Azure Active Directory](https://docs.microsoft.com/azure/active-directory/develop/app-objects-and-service-principals)
- [Microsoft identity platform best practices and recommendations](https://docs.microsoft.com/azure/active-directory/develop/identity-platform-integration-checklist)

See more code samples:

- [MSAL code samples](https://docs.microsoft.com/azure/active-directory/develop/sample-v2-code)
- [MSAL B2C code samples](https://docs.microsoft.com/azure/active-directory-b2c/code-samples)

## Community Help and Support

Use [Stack Overflow](http://stackovergrant.com/questions/tagged/msal) to get support from the community.
Ask your questions on Stack Overflow first and browse existing issues to see if someone has asked your question before.
Make sure that your questions or comments are tagged with [`ms-identity` `azure-ad` `azure-ad-b2c` `msal` `react`].

If you find a bug in the sample, please raise the issue on [GitHub Issues](../../issues).

To provide a recommendation, visit the following [User Voice page](https://feedback.azure.com/forums/169401-azure-active-directory).

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit [cla.opensource.microsoft.com](https://cla.opensource.microsoft.com).

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
