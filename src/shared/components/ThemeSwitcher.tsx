export const ThemeSwitcher = () => {
	return (
		<div className="dropdown dropdown-end">
			<button
				tabIndex={0}
				type="button"
				className="btn btn-ghost btn-sm rounded-xl opacity-70 hover:opacity-100"
			>
				<svg
					width="16px"
					height="16px"
					className="fill-current"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
				>
					<title>Palette icon</title>
					<path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 10c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
				</svg>
			</button>
			<ul
				tabIndex={-1}
				className="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl mt-2"
			>
				<li>
					<input
						type="radio"
						name="theme-dropdown"
						className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
						aria-label="Default"
						value="default"
					/>
				</li>
				<li>
					<input
						type="radio"
						name="theme-dropdown"
						className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
						aria-label="Cupcake"
						value="cupcake"
					/>
				</li>
				<li>
					<input
						type="radio"
						name="theme-dropdown"
						className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
						aria-label="Retro"
						value="retro"
					/>
				</li>
				<li>
					<input
						type="radio"
						name="theme-dropdown"
						className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
						aria-label="Cyberpunk"
						value="cyberpunk"
					/>
				</li>
				<li>
					<input
						type="radio"
						name="theme-dropdown"
						className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
						aria-label="Valentine"
						value="valentine"
					/>
				</li>
				<li>
					<input
						type="radio"
						name="theme-dropdown"
						className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
						aria-label="Aqua"
						value="aqua"
					/>
				</li>
			</ul>
		</div>
	);
};
