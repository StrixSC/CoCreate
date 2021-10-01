export const addUser = (username: string) => `
	INSERT INTO users(username)
	VALUES (${username});
`;

export const findUserById = (id: string) => `
	SELECT U.username FROM users U WHERE U.id = ${id} 
`;