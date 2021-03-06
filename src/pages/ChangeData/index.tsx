import { useCallback, useEffect, useState } from 'react';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PlanValue from '../../components/PlanValue';
import api from '../../services/api';
import InputFields from './InputFields';
import ListUserPlans from './ListUserPlans';
import { Container, Form, GymPlan, Label, SearchContent } from './style';

interface AllPlans {
  workout: string;
  servicePlan: 'Basic' | 'Individual';
}

interface UserResponse {
  id: string;
  name: string;
  rg: string;
  address: string;
  email: string;
  account: boolean;
  userPlan: AllPlans[];
}

export default function ChangeData() {
  const [plan, setPlan] = useState<AllPlans[]>([]);
  const [initialUserPlan, setInitialUserPlan] = useState<AllPlans[]>([]);
  const [basicValue, setBasicValue] = useState(0);
  const [individualValue, setIndividualValue] = useState(0);
  const [servicePlan, setServicePlan] = useState<AllPlans[]>([]);
  const [findUserInput, setFindUserInput] = useState('');
  const [userBasicPlan, setUserBasicPlan] = useState(false);
  const [userIndividualPlan, setUserIndividualPlan] = useState([]);
  const [userNotFound, setUserNotFound] = useState('');
  const [userFound, setUserFound] = useState<UserResponse>();
  const [userAccount, setUserAccount] = useState(false);

  useEffect(() => {
    api.get('plans/show').then(response => {
      setPlan(response.data.plans);
    });
  }, []);

  const handleSearch = useCallback(async () => {
    const findUser = await api.put('users/find', findUserInput);

    if (!findUser.data[0]) {
      setUserNotFound('Usuário não encontrado');
    } else {
      setUserAccount(findUser.data[0].account);
      setUserFound(findUser.data[0]);
      const { userPlan } = findUser.data[0];

      const findUserIndividualPlans = userPlan
        .filter((userPlans: AllPlans) =>
          userPlans.servicePlan !== 'Basic'
            ? userPlans
            : (setUserBasicPlan(true), setBasicValue(80)),
        )
        .map((p: AllPlans) => p.workout);

      setUserIndividualPlan(findUserIndividualPlans);
      setIndividualValue(120 * findUserIndividualPlans.length);
      setInitialUserPlan(userPlan);
    }
  }, [findUserInput]);

  function checkIndividualPlans(plans: AllPlans) {
    const checkingPlans = userIndividualPlan.filter(
      individual => plans.workout === individual,
    );

    return checkingPlans[0];
  }

  const handleValue = useCallback(
    event => {
      const { name, checked } = event.target;

      if (name === 'Basic') {
        if (checked) {
          const findBasicPlan = servicePlan.filter(
            service => service.servicePlan === 'Basic',
          );
          const addedBasicPlan = plan.filter(p => p.servicePlan === 'Basic');
          setBasicValue(80);

          if (servicePlan.length && !findBasicPlan.length) {
            setServicePlan([...servicePlan, ...addedBasicPlan]);
          }

          if (!servicePlan.length) {
            setServicePlan(addedBasicPlan);
          }
        } else {
          const removedBasicPlan = servicePlan.filter(
            p => p.servicePlan !== 'Basic',
          );
          setServicePlan(removedBasicPlan);
          setBasicValue(0);
        }
      }

      if (name !== 'Basic' && name !== 'account') {
        if (checked) {
          const findIndividualPlan = servicePlan.filter(
            service => service.workout === name,
          );
          const addedIndividualPlan = plan.filter(p => p.workout === name);
          setIndividualValue(individualValue + 120);

          if (servicePlan.length && !findIndividualPlan.length) {
            setServicePlan([...servicePlan, ...addedIndividualPlan]);
          }
          if (!servicePlan.length) {
            setServicePlan(addedIndividualPlan);
          }
        } else {
          const removedIndividualPlan = servicePlan.filter(
            p => p.workout !== name,
          );
          setServicePlan(removedIndividualPlan);
          setIndividualValue(individualValue - 120);
        }
      }

      if (name === 'account') {
        if (checked) {
          setUserAccount(true);
        } else {
          setUserAccount(false);
        }
      }
    },
    [individualValue, plan, servicePlan],
  );

  const handleForm = useCallback(
    async event => {
      event.preventDefault();

      const userForm = {
        id: findUserInput,
        name: event.target[0].value,
        rg: event.target[1].value,
        address: event.target[2].value,
        email: event.target[3].value,
        account: userAccount,
        userPlan: servicePlan.length === 0 ? initialUserPlan : servicePlan,
      };

      await api.put('/users/update', userForm);
    },
    [findUserInput, initialUserPlan, servicePlan, userAccount],
  );

  return (
    <Container>
      <h2>Alteração de dados cadastrais</h2>
      <SearchContent>
        <Input
          icon={HiOutlineDocumentReport}
          name="id"
          onChange={e => setFindUserInput(e.target.value)}
        />
        <Button type="button" onClick={() => handleSearch()}>
          Buscar
        </Button>
      </SearchContent>

      {userFound ? (
        <Form onSubmit={handleForm}>
          <InputFields
            name={userFound.name}
            rg={userFound.rg}
            address={userFound.address}
            email={userFound.email}
          />
          <ListUserPlans
            userBasicPlan={userBasicPlan}
            setUserBasicPlan={setUserBasicPlan}
            handleValue={handleValue}
            plan={plan}
            checkIndividualPlans={checkIndividualPlans}
          />
          <Label>
            <Input
              name="account"
              type="checkbox"
              onClick={handleValue}
              defaultChecked={userAccount}
            />
            Conta ativa ?
          </Label>
          <PlanValue
            basicValue={basicValue}
            individualValue={individualValue}
          />
          <Button type="submit">Enviar</Button>
        </Form>
      ) : (
        <h2>{userNotFound}</h2>
      )}
      <Link to="/">Voltar</Link>
    </Container>
  );
}
