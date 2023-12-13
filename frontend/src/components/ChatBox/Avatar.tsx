import { clsx } from 'clsx';

import botAvatarDefault from '@src/assets/images/BotAvatarDefault.svg';
import userAvatar from '@src/assets/images/UserAvatar.svg';

import './Avatar.css';

function Avatar({ type }: { type: 'user' | 'bot' }) {
	const avatarClass = clsx(
		'avatar-circle',
		type === 'user' ? 'avatar-circle-user' : 'avatar-circle-bot'
	);
	return (
		<div className={avatarClass}>
			<img src={type === 'user' ? userAvatar : botAvatarDefault} alt="" />
		</div>
	);
}

export default Avatar;
