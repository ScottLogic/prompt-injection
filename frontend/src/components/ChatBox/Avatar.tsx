import botAvatarDefault from '@src/assets/images/BotAvatarDefault.svg';
import userAvatar from '@src/assets/images/UserAvatar.svg';

import './Avatar.css';

function Avatar({ type }: { type: 'user' | 'bot' }) {
	return (
		<div className="avatar-circle">
			<img src={type === 'user' ? userAvatar : botAvatarDefault} alt="" />
		</div>
	);
}

export default Avatar;
