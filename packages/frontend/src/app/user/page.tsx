import { serverFetch } from '../../lib/serverFetch';

export default async function UserPage() {
  const userData = await serverFetch({ service: 'userService', path: '/users/me' });

  return (
    <div>
      <h1>User Information</h1>
      <p>Name: {userData.name}</p>
      <p>Email: {userData.email}</p>
    </div>
  );
}
