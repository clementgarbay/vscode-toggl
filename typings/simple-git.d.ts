declare module "simple-git" {
  type BranchData = {
    current: string;
  };

  type SimpleGit = {
    branchLocal: (callback: (error: any, data: BranchData) => void) => void;
  };

  const createSimpleGit: (folderPath: string) => SimpleGit;

  export = createSimpleGit;
}
