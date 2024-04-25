import { fetchAuthSession } from '@aws-amplify/auth';
import {
	withAuthenticator,
	WithAuthenticatorProps,
} from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { PropsWithChildren } from 'react';

import BotAvatar from '@src/assets/images/BotAvatarDefault.svg';
import App from '@src/components/App';
import { interceptRequest } from '@src/service/backendService';
/* eslint-disable import/order */
import '@src/styles/index.css';
import '@src/styles/Theme.css';
import './CognitoAuthenticator.css';
/* eslint-enable import/order */

const usernameFormField = {
	username: {
		label: 'Email address',
		placeholder: 'alice@example.com',
		isRequired: true,
	},
};

Amplify.configure({
	Auth: {
		Cognito: {
			userPoolId: import.meta.env.VITE_COGNITO_USERPOOL_ID,
			userPoolClientId: import.meta.env.VITE_COGNITO_USERPOOL_CLIENT,
			userPoolEndpoint: import.meta.env.VITE_COGNITO_USERPOOL_ENDPOINT,
			loginWith: {
				oauth: {
					domain: import.meta.env.VITE_COGNITO_USERPOOL_DOMAIN,
					redirectSignIn: [import.meta.env.VITE_COGNITO_REDIRECT_URL],
					redirectSignOut: [import.meta.env.VITE_COGNITO_REDIRECT_URL],
					responseType: 'code',
					scopes: ['openid', 'profile', 'email'],
				},
			},
		},
	},
});

interceptRequest('auth', async (request) => {
	const token = (await fetchAuthSession()).tokens?.accessToken.toString();
	if (!token) {
		console.warn('Auth session has expired!');
		return request;
	}
	return {
		...request,
		headers: {
			...request.headers,
			Authorization: token,
		},
	};
});

const CognitoAuthenticatedApp = withAuthenticator(
	({ user }: WithAuthenticatorProps) =>
		user ? (
			<App />
		) : (
			<div>Whoops, you should never see this... Login is misconfigured</div>
		),
	{
		hideSignUp: true,
		variation: 'default',
		components: {
			SignIn: {
				Header: WelcomeHeader,
			},
			ForgotPassword: {
				Header: ResetPasswordHeader,
			},
			ConfirmResetPassword: {
				Header: ResetPasswordHeader,
			},
			ForceNewPassword: {
				Header: ChangePasswordHeader,
			},
		},
		formFields: {
			signIn: {
				...usernameFormField,
			},
			forgotPassword: {
				...usernameFormField,
			},
		},
	}
);

function WelcomeHeader() {
	return (
		<CustomHeader classes="welcome-header">Welcome to SpyLogic</CustomHeader>
	);
}

function ResetPasswordHeader() {
	return <CustomHeader classes="form-header">Reset password</CustomHeader>;
}

function ChangePasswordHeader() {
	return <CustomHeader classes="form-header">Change password</CustomHeader>;
}

function CustomHeader({
	classes,
	children,
}: { classes: string } & PropsWithChildren) {
	return (
		<div className={classes}>
			<h3 className="amplify-heading amplify-heading--3">{children}</h3>
			<img alt="SpyLogic logo" src={BotAvatar} />
		</div>
	);
}

export default CognitoAuthenticatedApp;
