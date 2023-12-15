import { clsx } from 'clsx';

import botAvatarDefault from '@src/assets/images/BotAvatarDefault.svg';
import botAvatarError from '@src/assets/images/BotAvatarError.svg';
import userAvatar from '@src/assets/images/UserAvatar.svg';

import './Avatar.css';

function Avatar({ showAs }: { showAs: 'user' | 'bot' | 'botError' }) {
	const avatarClass = clsx(
		'avatar-circle',
		showAs === 'user' ? 'avatar-circle-user' : 'avatar-circle-bot'
	);

	const imageSource =
		showAs === 'user'
			? userAvatar
			: showAs === 'bot'
			? botAvatarDefault
			: botAvatarError;

	return (
		<div className={avatarClass}>
			<img src={imageSource} alt="" />
		</div>
	);
}

export default Avatar;
