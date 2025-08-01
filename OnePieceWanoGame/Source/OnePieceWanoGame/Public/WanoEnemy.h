#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "Components/SphereComponent.h"
#include "AIController.h"
#include "WanoEnemy.generated.h"

UENUM(BlueprintType)
enum class EWanoEnemyType : uint8
{
	BeastPirate		UMETA(DisplayName = "Beast Pirate"),
	Samurai			UMETA(DisplayName = "Wano Samurai"),
	Ninja			UMETA(DisplayName = "Wano Ninja"),
	Gifter			UMETA(DisplayName = "Gifter (SMILE user)"),
	Headliner		UMETA(DisplayName = "Headliner"),
	AllStar			UMETA(DisplayName = "All-Star"),
	Tobi_Roppo		UMETA(DisplayName = "Tobi Roppo"),
	Kaido			UMETA(DisplayName = "Kaido (Emperor)")
};

UENUM(BlueprintType)
enum class EEnemyState : uint8
{
	Idle		UMETA(DisplayName = "Idle"),
	Patrolling	UMETA(DisplayName = "Patrolling"),
	Chasing		UMETA(DisplayName = "Chasing"),
	Attacking	UMETA(DisplayName = "Attacking"),
	Stunned		UMETA(DisplayName = "Stunned"),
	Defeated	UMETA(DisplayName = "Defeated")
};

UCLASS()
class ONEPIECEWANOGAME_API AWanoEnemy : public ACharacter
{
	GENERATED_BODY()

public:
	AWanoEnemy();

protected:
	virtual void BeginPlay() override;

	// Detection sphere for player awareness
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "AI")
	USphereComponent* DetectionSphere;

	// Attack range sphere
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "AI")
	USphereComponent* AttackRange;

public:
	virtual void Tick(float DeltaTime) override;

	// Enemy properties
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Enemy Type")
	EWanoEnemyType EnemyType;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Enemy")
	FString EnemyName;

	// Combat stats
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
	float MaxHealth;

	UPROPERTY(BlueprintReadOnly, Category = "Combat")
	float CurrentHealth;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
	float AttackPower;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
	float DefensePower;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
	float AttackRange;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
	float AttackCooldown;

	// AI behavior
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AI")
	float DetectionRadius;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AI")
	float PatrolRadius;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AI")
	float MovementSpeed;

	UPROPERTY(BlueprintReadOnly, Category = "AI")
	EEnemyState CurrentState;

	UPROPERTY(BlueprintReadOnly, Category = "AI")
	class AOnePieceCharacter* TargetPlayer;

	// Combat state
	UPROPERTY(BlueprintReadOnly, Category = "Combat")
	bool bIsAttacking;

	UPROPERTY(BlueprintReadOnly, Category = "Combat")
	bool bIsStunned;

	UPROPERTY(BlueprintReadOnly, Category = "Combat")
	float LastAttackTime;

protected:
	// AI behavior functions
	UFUNCTION(BlueprintCallable, Category = "AI")
	void UpdateAIBehavior();

	UFUNCTION(BlueprintCallable, Category = "AI")
	void SetEnemyState(EEnemyState NewState);

	UFUNCTION(BlueprintCallable, Category = "AI")
	void StartChasing(AOnePieceCharacter* Player);

	UFUNCTION(BlueprintCallable, Category = "AI")
	void StopChasing();

	UFUNCTION(BlueprintCallable, Category = "AI")
	void PatrolArea();

	// Combat functions
	UFUNCTION(BlueprintCallable, Category = "Combat")
	void AttackPlayer();

	UFUNCTION(BlueprintCallable, Category = "Combat")
	void TakeDamage(float DamageAmount);

	UFUNCTION(BlueprintCallable, Category = "Combat")
	void Die();

	UFUNCTION(BlueprintCallable, Category = "Combat")
	void StunEnemy(float StunDuration);

	// Detection functions
	UFUNCTION()
	void OnDetectionSphereBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	UFUNCTION()
	void OnDetectionSphereEndOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex);

	UFUNCTION()
	void OnAttackRangeBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	UFUNCTION()
	void OnAttackRangeEndOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex);

public:
	// Public interface functions
	UFUNCTION(BlueprintCallable, Category = "Combat")
	bool IsAlive() const;

	UFUNCTION(BlueprintCallable, Category = "Combat")
	bool CanAttack() const;

	UFUNCTION(BlueprintCallable, Category = "AI")
	float GetDistanceToPlayer() const;

	// Special abilities based on enemy type
	UFUNCTION(BlueprintImplementableEvent, Category = "Special Abilities")
	void UseSpecialAbility();

	UFUNCTION(BlueprintCallable, Category = "Special Abilities")
	void ExecuteEnemyTypeSpecificBehavior();

	// Getters
	UFUNCTION(BlueprintCallable, Category = "Enemy")
	EWanoEnemyType GetEnemyType() const { return EnemyType; }

	UFUNCTION(BlueprintCallable, Category = "AI")
	EEnemyState GetCurrentState() const { return CurrentState; }
};