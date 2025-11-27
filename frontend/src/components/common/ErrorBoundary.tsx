import React, {Component, type ReactNode} from "react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {hasError: false, error: null};
	}

	static getDerivedStateFromError(error: Error): State {
		return {hasError: true, error};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
					<div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
						<h1 className='text-2xl font-bold text-red-600 mb-4'>
							Đã xảy ra lỗi
						</h1>
						<p className='text-gray-700 mb-4'>
							Ứng dụng gặp lỗi không mong muốn. Vui lòng làm mới
							trang.
						</p>
						{this.state.error && (
							<details className='mb-4'>
								<summary className='cursor-pointer text-sm text-gray-600 mb-2'>
									Chi tiết lỗi
								</summary>
								<pre className='text-xs bg-gray-100 p-3 rounded overflow-auto'>
									{this.state.error.toString()}
									{this.state.error.stack}
								</pre>
							</details>
						)}
						<button
							onClick={() => window.location.reload()}
							className='w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700'
						>
							Làm mới trang
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
