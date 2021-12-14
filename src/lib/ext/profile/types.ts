export type ProfileState = {
  all: Profile[];
  currentId: string;
  openTab?: boolean;
};

export interface Profile {
  id: string;
  name: string;
  avatarSeed: string;
}
