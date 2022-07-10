export type ProfileState = {
  all: Profile[];
  currentId: string;
};

export interface Profile {
  id: string;
  name: string;
  avatarSeed: string;
}
