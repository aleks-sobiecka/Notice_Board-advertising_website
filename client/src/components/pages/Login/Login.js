import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { API_URL } from '../../../config';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logIn } from '../../../redux/usersRedux';

const Login = () =>{

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState(null); // null. 'loading', 'success', 'serverError', 'clientError'
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = e => {
		e.preventDefault();

		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ login, password }),
		};
		setStatus('loading');
		fetch(`${API_URL}/auth/login`, options)
			.then(res => {
				if (res.status === 200) {
					setTimeout(() => {
						setStatus('success');
						fetch(`${API_URL}/auth/user`)
							.then(res => {
								if (res.status === 200) {
									return res.json();
								} else {
									throw new Error('Failed');
								}
							})
							.then(data => {
								dispatch(logIn({ login: data.user, id: data.id }));
							})
							.catch(e => {
							});
					}, 400);
					setTimeout(() => {
						navigate('/');
					}, 2000);
				} else if (res.status === 400) {
					setStatus('clientError');
				} else if (res.status === 409) {
					setStatus('loginError');
				} else {
					setStatus('serverError');
				}
			})
			.catch(err => {
				setStatus('serverError');
			});
	};

    return (
        <Form className="col-12 col-sm-3 mx-auto" onSubmit={handleSubmit}>

            <h1 className="my-4 text-center">Log in</h1>

            {status === "success" && (
                <div>
                    <Alert variant="success">
                        <Alert.Heading>Success!</Alert.Heading>
                        <p>You have been successfully logged in!</p>
                    </Alert>
                    <Spinner animation="border" role="status" className="d-block mx-auto my-3">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}

            {status === "serverError" && (
                <Alert variant="danger">
                    <Alert.Heading>Something went wrong...</Alert.Heading>
                    <p>Unexpected error... Try again!</p>
                </Alert>
            )}

            {status === "clientError" && (
                <Alert variant="danger">
                    <Alert.Heading>Incorrect data</Alert.Heading>
                    <p>Login or Password are incorrect...</p>
                </Alert>
            )}

            {status === "loading" && (
                <Spinner animation="border" role="status" className="d-block mx-auto my-3">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            )}

            <Form.Group className="mb-3 d-flex align-items-center" controlId="formLogin">
                <Form.Label className="my-0" style={{ flex: '1 0 0' }}>Login</Form.Label>
                <Form.Control type="text" style={{ flex: '3 0 0' }} className="ms-2 shadow-none" value={login} onChange={e => setLogin(e.target.value)} placeholder="Enter login" />
            </Form.Group>

            <Form.Group className="mb-3 d-flex align-items-center" controlId="formPassword">
                <Form.Label className="my-0" style={{ flex: '1 0 0' }}>Password</Form.Label>
                <Form.Control type="password" style={{ flex: '3 0 0' }} className="ms-2 shadow-none" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            </Form.Group>

            <Button className="my-2 w-100 shadow-none" variant="success" type="submit">
                Log in
            </Button>

        </Form>
    )
}

export default Login;