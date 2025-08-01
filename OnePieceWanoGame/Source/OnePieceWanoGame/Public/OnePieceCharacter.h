#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "InputActionValue.h"
#include "OnePieceCharacter.generated.h"

class UInputMappingContext;
class UInputAction;
class UCameraComponent;
class USpringArmComponent;

UENUM(BlueprintType)
enum class EDevilFruitType : uint8
{
	None		UMETA(DisplayName = "None"),
	Paramecia	UMETA(DisplayName = "Paramecia"),
	Zoan		UMETA(DisplayName = "Zoan"),
	Logia		UMETA(DisplayName = "Logia")
};

UENUM(BlueprintType)
enum class EHakiType : uint8
{
	None			UMETA(DisplayName = "None"),
	Observation		UMETA(DisplayName = "Observation Haki"),
	Armament		UMETA(DisplayName = "Armament Haki"),
	Conqueror		UMETA(DisplayName = "Conqueror's Haki")
};

UENUM(BlueprintType)
enum class EOnePieceCharacterType : uint8
{
	Luffy		UMETA(DisplayName = "Monkey D. Luffy"),
	Zoro		UMETA(DisplayName = "Roronoa Zoro"),
	Sanji		UMETA(DisplayName = "Vinsmoke Sanji"),
	Nami		UMETA(DisplayName = "Nami"),
	Usopp		UMETA(DisplayName = "Usopp"),
	Chopper		UMETA(DisplayName = "Tony Tony Chopper"),
	Robin		UMETA(DisplayName = "Nico Robin"),
	Franky		UMETA(DisplayName = "Franky"),
	Brook		UMETA(DisplayName = "Brook"),
	Jinbe		UMETA(DisplayName = "Jinbe"),
	Kaido		UMETA(DisplayName = "Kaido"),
	BigMom		UMETA(DisplayName = "Charlotte Linlin"),
	Oden		UMETA(DisplayName = "Kozuki Oden"),
	Yamato		UMETA(DisplayName = "Yamato")
};

UCLASS(config=Game)
class ONEPIECEWANOGAME_API AOnePieceCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	AOnePieceCharacter();

protected:
	// Camera components
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Camera, meta = (AllowPrivateAccess = "true"))
	USpringArmComponent* CameraBoom;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Camera, meta = (AllowPrivateAccess = "true"))
	UCameraComponent* FollowCamera;

	// Input components
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input, meta = (AllowPrivateAccess = "true"))
	UInputMappingContext* DefaultMappingContext;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input, meta = (AllowPrivateAccess = "true"))
	UInputAction* JumpAction;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input, meta = (AllowPrivateAccess = "true"))
	UInputAction* MoveAction;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input, meta = (AllowPrivateAccess = "true"))
	UInputAction* LookAction;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input, meta = (AllowPrivateAccess = "true"))
	UInputAction* AttackAction;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input, meta = (AllowPrivateAccess = "true"))
	UInputAction* SpecialAttackAction;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input, meta = (AllowPrivateAccess = "true"))
	UInputAction* HakiAction;

public:
	// Character properties
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	EOnePieceCharacterType CharacterType;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Devil Fruit")
	EDevilFruitType DevilFruitType;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Devil Fruit")
	FString DevilFruitName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Haki")
	TArray<EHakiType> AvailableHakiTypes;

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
	float MovementSpeed;

	// Combat state
	UPROPERTY(BlueprintReadOnly, Category = "Combat")
	bool bIsAttacking;

	UPROPERTY(BlueprintReadOnly, Category = "Combat")
	bool bIsUsingHaki;

	UPROPERTY(BlueprintReadOnly, Category = "Combat")
	bool bIsUsingDevilFruit;

protected:
	virtual void BeginPlay() override;
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

	// Input callbacks
	void Move(const FInputActionValue& Value);
	void Look(const FInputActionValue& Value);
	void Attack(const FInputActionValue& Value);
	void SpecialAttack(const FInputActionValue& Value);
	void ActivateHaki(const FInputActionValue& Value);

public:
	// Combat functions
	UFUNCTION(BlueprintCallable, Category = "Combat")
	void TakeDamage(float DamageAmount);

	UFUNCTION(BlueprintCallable, Category = "Combat")
	void Heal(float HealAmount);

	UFUNCTION(BlueprintCallable, Category = "Combat")
	bool IsAlive() const;

	// Devil Fruit abilities
	UFUNCTION(BlueprintCallable, Category = "Devil Fruit")
	void UseDevilFruitAbility();

	UFUNCTION(BlueprintImplementableEvent, Category = "Devil Fruit")
	void OnDevilFruitAbilityUsed();

	// Haki abilities
	UFUNCTION(BlueprintCallable, Category = "Haki")
	void UseHaki(EHakiType HakiType);

	UFUNCTION(BlueprintImplementableEvent, Category = "Haki")
	void OnHakiActivated(EHakiType HakiType);

	UFUNCTION(BlueprintCallable, Category = "Haki")
	bool CanUseHaki(EHakiType HakiType) const;

	// Character-specific abilities
	UFUNCTION(BlueprintImplementableEvent, Category = "Character")
	void ExecuteCharacterSpecificAbility();

	// Getters
	FORCEINLINE USpringArmComponent* GetCameraBoom() const { return CameraBoom; }
	FORCEINLINE UCameraComponent* GetFollowCamera() const { return FollowCamera; }
};