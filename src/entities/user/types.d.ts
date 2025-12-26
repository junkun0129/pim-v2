export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  roleId: string; // Link to Role
  activeExtensions: ExtensionType[]; // Which extensions this user/tenant has purchased
}

export type UseUserProps = {
  userList: User[];
};
