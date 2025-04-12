import { trpc } from "../../../lib/trpc";
import { useState, useEffect } from "react";
import { Button } from "../../../components/Button";
import { Segment } from "../../../components/Segment";
import { withPageWrapper } from "../../../lib/pageWrapper";
import styles from "./index.module.scss";
export const AdminSpecialistsPage = () => {
    const [specialists, setSpecialists] = useState([]);
    const { data, isLoading, isError, refetch } = trpc.getUnverifiedSpecialists.useQuery();
  
    const verifySpecialistMutation = trpc.verifySpecialist.useMutation({
      onSuccess: () => {
        alert("Специалист подтверждён!");
        // Перезапускаем запрос, чтобы обновить список специалистов
        refetch();
      },
      onError: (error) => {
        console.error("Ошибка при подтверждении специалиста:", error);
        alert("Ошибка при подтверждении специалиста");
      },
    });
  
    const rejectSpecialistMutation = trpc.rejectSpecialist.useMutation({
      onSuccess: () => {
        alert("Специалист отклонён!");
        // Перезапускаем запрос, чтобы обновить список специалистов
        refetch();
      },
      onError: (error) => {
        console.error("Ошибка при отклонении специалиста:", error);
        alert("Ошибка при отклонении специалиста");
      },
    });
  
    useEffect(() => {
      if (data) {
        setSpecialists(data);
      }
    }, [data]);
  
    if (isLoading) return <div>Загрузка...</div>;
    if (isError) return <div>Ошибка при загрузке специалистов</div>;
  
    const handleVerify = (specialistId: string) => {
      verifySpecialistMutation.mutate({ specialistId });
    };
  
    const handleReject = (specialistId: string) => {
      rejectSpecialistMutation.mutate({ specialistId });
    };
  
    return (
      <div className={styles.container}>
        {/* Right block with segments */}
        <div className={styles.segments}>
          <div className={styles.segment}>
            <Segment title="Специалисты" size={2}>
              <div>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Имя</th>
                      <th>Email</th>
                      <th>Специальность</th>
                      <th>Документ</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specialists.map((specialist) => (
                      <tr key={specialist.id}>
                        <td>{specialist.user.name}</td>
                        <td>{specialist.user.email}</td>
                        <td>{specialist.specialty}</td>
                        <td>
                          {specialist.document ? (
                            <a href={specialist.document} target="_blank" rel="noopener noreferrer">
                              Просмотр документа
                            </a>
                          ) : (
                            "Документ не предоставлен"
                          )}
                        </td>
                        <td>
                          <Button className={styles.greenButton} onClick={() => handleVerify(specialist.id)}>
                            Подтвердить
                          </Button>
                          <Button className={styles.redButton} onClick={() => handleReject(specialist.id)}>
                            Отклонить
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Segment>
          </div>
        </div>
      </div>
    );
  };
  