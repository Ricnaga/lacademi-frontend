import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';
import RemoveWorkout from './RemoveWorkout';
import { AddField, AllFields, Container, Form, RemoveField } from './style';

interface WorkoutRequest {
  servicePlan: string;
  workout: string;
}

const Workouts: React.FC = () => {
  const [newWorkout, setNewWorkout] = useState('');
  const [newservicePlan, setNewServicePlan] = useState('');
  const [newRemoveBasicWorkout, setNewRemoveBasicWorkout] = useState<string[]>(
    [],
  );
  const [newRemoveIndividualWorkout, setNewRemoveIndividualWorkout] = useState<
    string[]
  >([]);

  useEffect(() => {
    api.get('/plans/show').then(response => {
      const basic = response.data.plans
        .filter(
          (workouts: WorkoutRequest) =>
            workouts.servicePlan === 'Basic' && workouts.workout,
        )
        .map((workouts: WorkoutRequest) => workouts.workout);

      const individual = response.data.plans
        .filter(
          (workouts: WorkoutRequest) =>
            workouts.servicePlan === 'Individual' && workouts.workout,
        )
        .map((workouts: WorkoutRequest) => workouts.workout);

      setNewRemoveBasicWorkout(basic);
      setNewRemoveIndividualWorkout(individual);
    });
  }, []);

  const handleAddWorkout = useCallback(() => {
    if (newWorkout && newservicePlan === 'Basic') {
      setNewRemoveBasicWorkout([...newRemoveBasicWorkout, newWorkout]);
    }

    if (newWorkout && newservicePlan === 'Individual') {
      setNewRemoveIndividualWorkout([
        ...newRemoveIndividualWorkout,
        newWorkout,
      ]);
    }
  }, [
    newWorkout,
    newservicePlan,
    newRemoveBasicWorkout,
    newRemoveIndividualWorkout,
  ]);

  const handleRemoveBasicWorkout = useCallback(
    removeItem => {
      const item = newRemoveBasicWorkout.filter(basic => basic !== removeItem);
      setNewRemoveBasicWorkout(item);
    },
    [newRemoveBasicWorkout],
  );

  const handleRemoveIndividualWorkout = useCallback(
    removeItem => {
      const item = newRemoveIndividualWorkout.filter(
        individual => individual !== removeItem,
      );
      setNewRemoveIndividualWorkout(item);
    },
    [newRemoveIndividualWorkout],
  );

  const handleCreateWorkout = useCallback(
    async event => {
      event.preventDefault();
      const updatedWorkouts: WorkoutRequest[] = [];
      newRemoveBasicWorkout.map(workout =>
        updatedWorkouts.push({
          workout,
          servicePlan: 'Basic',
        }),
      );

      newRemoveIndividualWorkout.map(workout =>
        updatedWorkouts.push({
          workout,
          servicePlan: 'Individual',
        }),
      );

      await api.put('plans/update', updatedWorkouts);
    },
    [newRemoveBasicWorkout, newRemoveIndividualWorkout],
  );

  return (
    <>
      <Container>
        <h2>Pacote de treinos</h2>

        <Form onSubmit={handleCreateWorkout} id="SendForm">
          <AllFields>
            <AddField>
              <fieldset>
                <legend>Adicionar</legend>
                <Input
                  name="workout"
                  value={newWorkout}
                  onChange={e => setNewWorkout(e.target.value)}
                  placeholder="Digite o nome do treino"
                />
                <select
                  id="plans"
                  value={newservicePlan}
                  onChange={e => setNewServicePlan(e.target.value)}
                >
                  <option>&nbsp;</option>
                  <option value="Basic">Básico</option>
                  <option value="Individual">Individual</option>
                </select>
                <Button type="button" onClick={handleAddWorkout}>
                  +
                </Button>
              </fieldset>
            </AddField>

            <RemoveField>
              <fieldset>
                <legend>Remover</legend>
                <RemoveWorkout
                  title="Básico"
                  workout={newRemoveBasicWorkout}
                  removeWorkoutName={handleRemoveBasicWorkout}
                />
                <RemoveWorkout
                  title="Individual"
                  workout={newRemoveIndividualWorkout}
                  removeWorkoutName={handleRemoveIndividualWorkout}
                />
              </fieldset>
            </RemoveField>
          </AllFields>
          <Button type="submit">Salvar</Button>
        </Form>
        <Link to="/">Voltar</Link>
      </Container>
    </>
  );
};
export default Workouts;
