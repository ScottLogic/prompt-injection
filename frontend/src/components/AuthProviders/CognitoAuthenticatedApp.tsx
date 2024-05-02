import { fetchAuthSession, signInWithRedirect } from '@aws-amplify/auth';
import {
	Alert,
	Button,
	Fieldset,
	Flex,
	PasswordField,
	Tabs,
	TextField,
	useAuthenticator,
	withAuthenticator,
	WithAuthenticatorProps,
} from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { FormEvent, useEffect, useState } from 'react';

import AzureLogo from '@src/assets/icons/Azure.svg';
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
				Footer: () => null,
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
		<>
			<CustomHeader className="welcome-header" heading="Welcome to SpyLogic" />
			<SignInSelector />
		</>
	);
}

function ResetPasswordHeader() {
	return <CustomHeader className="form-header" heading="Reset password" />;
}

function ChangePasswordHeader() {
	return <CustomHeader className="form-header" heading="Change password" />;
}

function CustomHeader({
	className,
	heading,
}: {
	className: string;
	heading: string;
}) {
	return (
		<div className={className}>
			<h1 className="amplify-heading amplify-heading--3">{heading}</h1>
			<img alt="SpyLogic logo" src={BotAvatar} />
		</div>
	);
}

function SignInSelector() {
	return (
		<Tabs
			defaultValue="basic"
			justifyContent="space-between"
			aria-label="Choose sign-in method"
			items={[
				{
					label: 'Username / password',
					value: 'basic',
					content: <BasicSignIn />,
				},
				{
					label: 'Single Sign On (SSO)',
					value: 'sso',
					content: <SSOSignIn />,
				},
			]}
		/>
	);
}

function BasicSignIn() {
	const { authStatus, error, isPending, submitForm, toForgotPassword } =
		useAuthenticator((context) => [context.submitForm]);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [usernameInvalidReason, setUsernameInvalidReason] = useState('');
	const [passwordInvalidReason, setPasswordInvalidReason] = useState('');
	const [isMounted, setMounted] = useState(false);

	const submitIsDisabled = !username || !password;

	useEffect(() => {
		console.log(`pending=${isPending} status=${authStatus} error=${error}`);
	}, [error, isPending]);

	useEffect(() => {
		if (isMounted) checkUsernameValidity();
	}, [username]);

	useEffect(() => {
		if (isMounted) checkPasswordValidity();
	}, [password]);

	useEffect(() => {
		setMounted(true);
	}, []);

	function checkUsernameValidity() {
		setUsernameInvalidReason(username ? '' : 'Username cannot be empty');
	}

	function checkPasswordValidity() {
		setPasswordInvalidReason(password ? '' : 'Password cannot be empty');
	}

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (submitIsDisabled) {
			checkUsernameValidity();
			checkPasswordValidity();
		} else {
			submitForm({ username, password });
		}
	}

	return (
		<>
			<form
				data-amplify-form=""
				className="basic-login-form amplify-flex flex-column"
				onSubmit={handleSubmit}
			>
				<Fieldset legend="Sign in" legendHidden={true} direction="column">
					<TextField
						label="Email address"
						value={username}
						placeholder="alice@example.com"
						hasError={!!usernameInvalidReason}
						errorMessage={usernameInvalidReason}
						onChange={({ target: { value } }) => {
							setUsername(value);
						}}
					/>
					<PasswordField
						label="Password"
						placeholder="Enter your password"
						hasError={!!passwordInvalidReason}
						errorMessage={passwordInvalidReason}
						onChange={({ target: { value } }) => {
							setPassword(value);
						}}
					/>
				</Fieldset>
				{error && (
					<Alert variation="error" isDismissible={true} hasIcon={true}>
						{error}
					</Alert>
				)}
				<Button
					type="submit"
					variation="primary"
					loadingText="Signing in"
					isLoading={isPending}
					aria-disabled={submitIsDisabled}
				>
					Sign in
				</Button>
				<Button variation="link" onClick={toForgotPassword}>
					Forgot your password?
				</Button>
			</form>
		</>
	);
}

function SSOSignIn() {
	function federatedSignIn() {
		void signInWithRedirect({
			provider: {
				custom: 'Azure',
			},
		});
		// TODO Catch login errors, e.g. someone without SL SSO access tries their luck
	}

	return (
		<div
			data-amplify-form=""
			className="sso-login-form amplify-flex flex-column"
		>
			<p>If you have a Scott Logic email address, sign in via SSO:</p>
			<Button
				type="button"
				variation="primary"
				loadingText="Redirecting"
				onClick={federatedSignIn}
			>
				<Flex justifyContent="center">
					<img className="azure-logo" alt="Azure logo" src={AzureLogo} />
					Sign in with Azure
				</Flex>
			</Button>
		</div>
	);
}

export default CognitoAuthenticatedApp;
