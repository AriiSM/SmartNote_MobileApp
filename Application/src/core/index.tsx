export const getLogger: (tag: string) => (args: any) => void =
    tag => args => console.log(tag, args);

export const authConfig = (token?: string) => ({
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
    });
