import {create} from 'zustand';

type State = {
  isSizeSelected: boolean;
};

type Reducers = {
  setIsSizeSelected: (isSizeSelected: boolean) => void;
};

type Store = State & Reducers;

const initialState: State = {
  isSizeSelected: false,
};

export const useStore = create<Store>((set) => ({
  ...initialState,
  setIsSizeSelected: (isSizeSelected) =>
    set((state) => ({...state, isSizeSelected})),
}));
