import Task from '../../src/task';
import { TaskRunOptions } from '../../src/types';
import { OlaLinearPoolDeployment } from './input';

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as OlaLinearPoolDeployment;
  const args = [input.Vault];
  await task.deployAndVerify('OlaLinearPoolFactory', args, from, force);
};
