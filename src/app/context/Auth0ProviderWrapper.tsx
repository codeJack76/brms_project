// 'use client';

// // import { Auth0Provider } from '@auth0/auth0-react';
// import { useRouter } from 'next/navigation';
// import { ReactNode } from 'react';

// interface Auth0ProviderWrapperProps {
//   children: ReactNode;
// }

// export default function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
//   const router = useRouter();

//   const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '';
//   const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '';
//   const redirectUri = typeof window !== 'undefined' ? window.location.origin : '';

//   const onRedirectCallback = (appState?: any) => {
//     router.push(appState?.returnTo || '/');
//   };

//   if (!domain || !clientId) {
//     console.error('Auth0 credentials not found. Please check your .env.local file.');
//     return <>{children}</>;
//   }

//   return (
//     // <Auth0Provider
//       domain={domain}
//       clientId={clientId}
//       authorizationParams={{
//         redirect_uri: redirectUri,
//         audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
//         scope: 'openid profile email',
//       }}
//       onRedirectCallback={onRedirectCallback}
//       cacheLocation="localstorage"
//     >
//       {children}
//     // </Auth0Provider>
//   );
// }
