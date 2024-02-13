import { useRef, useEffect } from 'react';

function UseIsFirstRender() {
	const isMountRef = useRef(true);
	useEffect(() => {
		isMountRef.current = false;
	}, []);
	return isMountRef.current;
}

export default UseIsFirstRender;
