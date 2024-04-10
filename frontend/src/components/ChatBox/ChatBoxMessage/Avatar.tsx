import { clsx } from 'clsx';

import botAvatarDefault from '@src/assets/images/BotAvatarDefault.svg';
import botAvatarError from '@src/assets/images/BotAvatarError.svg';
import userAvatar from '@src/assets/images/UserAvatar.svg';

import './Avatar.css';

function Avatar({ avatar }: { avatar: 'user' | 'bot' | 'botError' }) {
	const avatarCircleClass = clsx(
		'avatar-circle',
		avatar === 'user' ? 'avatar-circle-user' : 'avatar-circle-bot'
	);

	const imageSource =
		avatar === 'user'
			? userAvatar
			: avatar === 'bot'
			? botAvatarDefault
			: botAvatarError;

	return (
		<div className={avatarCircleClass}>
			<img src={imageSource} alt="" />
		</div>
	);
}

export default Avatar;
