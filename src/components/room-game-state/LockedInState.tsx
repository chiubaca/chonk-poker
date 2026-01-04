export function LockedInState() {
	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body items-center text-center py-16">
				<div className="text-6xl mb-4">🔒</div>
				<h2 className="card-title text-3xl mb-2">All Locked In!</h2>
				<p className="text-base-content/70">
					Waiting for cards to be revealed...
				</p>
			</div>
		</div>
	);
}
