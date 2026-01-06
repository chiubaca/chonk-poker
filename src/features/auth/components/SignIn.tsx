export const SignIn = ({ signIn }: { signIn: () => void }) => {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 p-4">
			<div className="card w-full max-w-sm bg-base-200 shadow-2xl border-4 border-base-300 rounded-3xl overflow-hidden">
				{/* Cute decorative header */}
				<div className="bg-gradient-to-r from-primary/20 to-secondary/20 py-6 px-4">
					<div className="flex justify-center mb-4">
						{/* Cute cat mascot */}
						<div className="text-6xl animate-bounce">
							<span role="img" aria-label="cat">
								{"(=^.^=)"}
							</span>
						</div>
					</div>
					<h1 className="text-center text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						Chonk Poker
					</h1>
					<p className="text-center text-sm mt-1 opacity-70 font-medium">
						Planning poker for adorable teams
					</p>
				</div>

				<div className="card-body items-center text-center pt-6 pb-8">
					{/* Floating cards decoration */}
					<div className="flex gap-2 mb-4">
						<div className="w-8 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-lg font-bold rotate-[-8deg] shadow-md border-2 border-primary/30">
							1
						</div>
						<div className="w-8 h-12 bg-secondary/20 rounded-lg flex items-center justify-center text-lg font-bold rotate-[4deg] shadow-md border-2 border-secondary/30">
							3
						</div>
						<div className="w-8 h-12 bg-accent/20 rounded-lg flex items-center justify-center text-lg font-bold rotate-[-2deg] shadow-md border-2 border-accent/30">
							5
						</div>
						<div className="w-8 h-12 bg-info/20 rounded-lg flex items-center justify-center text-lg font-bold rotate-[6deg] shadow-md border-2 border-info/30">
							8
						</div>
					</div>

					<p className="text-base-content/60 mb-6 text-sm px-4">
						Join your team for collaborative estimation sessions!
					</p>

					<button
						onClick={async () => {
							await signIn();
						}}
						type="button"
						className="btn btn-primary btn-lg w-full max-w-xs rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 gap-3 font-bold"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24">
							<title>Google logo</title>
							<path
								fill="currentColor"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="currentColor"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="currentColor"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="currentColor"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Sign in with Google
					</button>

					<p className="text-xs opacity-50 mt-4">
						Free forever. No credit card required.
					</p>
				</div>
			</div>
		</div>
	);
};
