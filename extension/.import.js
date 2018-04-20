let files = [
	'components/mylo/RoleCheck.js',
	'components/mylo/JumpButtons.js'
];

files.forEach(file => {
	let s = document.createElement('script');
	s.src=file; s.type="module";
	document.head.appendChild(s);
});