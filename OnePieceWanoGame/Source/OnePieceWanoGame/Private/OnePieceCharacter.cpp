#include "OnePieceCharacter.h"
#include "Engine/LocalPlayer.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "GameFramework/Controller.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "InputActionValue.h"
#include "Engine/Engine.h"

AOnePieceCharacter::AOnePieceCharacter()
{
	// Set size for collision capsule
	GetCapsuleComponent()->SetCapsuleSize(42.f, 96.0f);

	// Don't rotate when the controller rotates. Let that just affect the camera.
	bUseControllerRotationPitch = false;
	bUseControllerRotationYaw = false;
	bUseControllerRotationRoll = false;

	// Configure character movement
	GetCharacterMovement()->bOrientRotationToMovement = true;
	GetCharacterMovement()->RotationRate = FRotator(0.0f, 500.0f, 0.0f);
	GetCharacterMovement()->JumpZVelocity = 700.f;
	GetCharacterMovement()->AirControl = 0.35f;
	GetCharacterMovement()->MaxWalkSpeed = 500.f;
	GetCharacterMovement()->MinAnalogWalkSpeed = 20.f;
	GetCharacterMovement()->BrakingDecelerationWalking = 2000.f;
	GetCharacterMovement()->BrakingDecelerationFalling = 1500.0f;

	// Create a camera boom (pulls in towards the player if there is a collision)
	CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
	CameraBoom->SetupAttachment(RootComponent);
	CameraBoom->TargetArmLength = 400.0f;
	CameraBoom->bUsePawnControlRotation = true;

	// Create a follow camera
	FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
	FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
	FollowCamera->bUsePawnControlRotation = false;

	// Initialize default values
	CharacterType = EOnePieceCharacterType::Luffy;
	DevilFruitType = EDevilFruitType::Paramecia;
	DevilFruitName = TEXT("Gomu Gomu no Mi");
	
	// Initialize Luffy's Haki abilities
	AvailableHakiTypes.Add(EHakiType::Observation);
	AvailableHakiTypes.Add(EHakiType::Armament);
	AvailableHakiTypes.Add(EHakiType::Conqueror);

	// Combat stats
	MaxHealth = 1000.0f;
	CurrentHealth = MaxHealth;
	AttackPower = 100.0f;
	DefensePower = 50.0f;
	MovementSpeed = 500.0f;

	// Combat state
	bIsAttacking = false;
	bIsUsingHaki = false;
	bIsUsingDevilFruit = false;
}

void AOnePieceCharacter::BeginPlay()
{
	Super::BeginPlay();

	// Add Input Mapping Context
	if (APlayerController* PlayerController = Cast<APlayerController>(Controller))
	{
		if (UEnhancedInputLocalPlayerSubsystem* Subsystem = ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PlayerController->GetLocalPlayer()))
		{
			Subsystem->AddMappingContext(DefaultMappingContext, 0);
		}
	}

	// Set movement speed based on character stats
	GetCharacterMovement()->MaxWalkSpeed = MovementSpeed;

	UE_LOG(LogTemp, Warning, TEXT("Character %s initialized with Devil Fruit: %s"), 
		*UEnum::GetValueAsString(CharacterType), *DevilFruitName);
}

void AOnePieceCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	// Set up action bindings
	if (UEnhancedInputComponent* EnhancedInputComponent = Cast<UEnhancedInputComponent>(PlayerInputComponent))
	{
		// Jumping
		EnhancedInputComponent->BindAction(JumpAction, ETriggerEvent::Started, this, &ACharacter::Jump);
		EnhancedInputComponent->BindAction(JumpAction, ETriggerEvent::Completed, this, &ACharacter::StopJumping);

		// Moving
		EnhancedInputComponent->BindAction(MoveAction, ETriggerEvent::Triggered, this, &AOnePieceCharacter::Move);

		// Looking
		EnhancedInputComponent->BindAction(LookAction, ETriggerEvent::Triggered, this, &AOnePieceCharacter::Look);

		// Combat
		EnhancedInputComponent->BindAction(AttackAction, ETriggerEvent::Started, this, &AOnePieceCharacter::Attack);
		EnhancedInputComponent->BindAction(SpecialAttackAction, ETriggerEvent::Started, this, &AOnePieceCharacter::SpecialAttack);
		EnhancedInputComponent->BindAction(HakiAction, ETriggerEvent::Started, this, &AOnePieceCharacter::ActivateHaki);
	}
}

void AOnePieceCharacter::Move(const FInputActionValue& Value)
{
	FVector2D MovementVector = Value.Get<FVector2D>();

	if (Controller != nullptr)
	{
		// Find out which way is forward
		const FRotator Rotation = Controller->GetControlRotation();
		const FRotator YawRotation(0, Rotation.Yaw, 0);

		// Get forward vector
		const FVector ForwardDirection = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::X);

		// Get right vector 
		const FVector RightDirection = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::Y);

		// Add movement 
		AddMovementInput(ForwardDirection, MovementVector.Y);
		AddMovementInput(RightDirection, MovementVector.X);
	}
}

void AOnePieceCharacter::Look(const FInputActionValue& Value)
{
	FVector2D LookAxisVector = Value.Get<FVector2D>();

	if (Controller != nullptr)
	{
		// Add yaw and pitch input to controller
		AddControllerYawInput(LookAxisVector.X);
		AddControllerPitchInput(LookAxisVector.Y);
	}
}

void AOnePieceCharacter::Attack(const FInputActionValue& Value)
{
	if (bIsAttacking)
		return;

	bIsAttacking = true;

	UE_LOG(LogTemp, Warning, TEXT("%s performs basic attack!"), *UEnum::GetValueAsString(CharacterType));

	// Character-specific attack logic
	switch (CharacterType)
	{
		case EOnePieceCharacterType::Luffy:
			UE_LOG(LogTemp, Warning, TEXT("Gomu Gomu no Pistol!"));
			break;
		case EOnePieceCharacterType::Zoro:
			UE_LOG(LogTemp, Warning, TEXT("Oni Giri!"));
			break;
		case EOnePieceCharacterType::Sanji:
			UE_LOG(LogTemp, Warning, TEXT("Collier Shoot!"));
			break;
		default:
			break;
	}

	// Reset attack state after a delay (this would typically be done with animation notifications)
	GetWorld()->GetTimerManager().SetTimer(FTimerHandle(), [this]()
	{
		bIsAttacking = false;
	}, 1.0f, false);
}

void AOnePieceCharacter::SpecialAttack(const FInputActionValue& Value)
{
	if (bIsAttacking)
		return;

	UseDevilFruitAbility();
}

void AOnePieceCharacter::ActivateHaki(const FInputActionValue& Value)
{
	if (AvailableHakiTypes.Num() > 0)
	{
		UseHaki(AvailableHakiTypes[0]); // Use first available Haki type
	}
}

void AOnePieceCharacter::TakeDamage(float DamageAmount)
{
	float FinalDamage = FMath::Max(0.0f, DamageAmount - DefensePower);
	CurrentHealth = FMath::Max(0.0f, CurrentHealth - FinalDamage);

	UE_LOG(LogTemp, Warning, TEXT("%s takes %f damage! Health: %f/%f"), 
		*UEnum::GetValueAsString(CharacterType), FinalDamage, CurrentHealth, MaxHealth);

	if (CurrentHealth <= 0.0f)
	{
		UE_LOG(LogTemp, Warning, TEXT("%s has been defeated!"), *UEnum::GetValueAsString(CharacterType));
		// Handle character defeat
	}
}

void AOnePieceCharacter::Heal(float HealAmount)
{
	CurrentHealth = FMath::Min(MaxHealth, CurrentHealth + HealAmount);
	UE_LOG(LogTemp, Warning, TEXT("%s healed for %f! Health: %f/%f"), 
		*UEnum::GetValueAsString(CharacterType), HealAmount, CurrentHealth, MaxHealth);
}

bool AOnePieceCharacter::IsAlive() const
{
	return CurrentHealth > 0.0f;
}

void AOnePieceCharacter::UseDevilFruitAbility()
{
	if (DevilFruitType == EDevilFruitType::None)
		return;

	bIsUsingDevilFruit = true;

	UE_LOG(LogTemp, Warning, TEXT("%s uses %s ability!"), 
		*UEnum::GetValueAsString(CharacterType), *DevilFruitName);

	// Character-specific Devil Fruit abilities
	switch (CharacterType)
	{
		case EOnePieceCharacterType::Luffy:
			UE_LOG(LogTemp, Warning, TEXT("Gomu Gomu no Bazooka!"));
			break;
		case EOnePieceCharacterType::Chopper:
			UE_LOG(LogTemp, Warning, TEXT("Monster Point!"));
			break;
		case EOnePieceCharacterType::Robin:
			UE_LOG(LogTemp, Warning, TEXT("Mil Fleur: Giganteum!"));
			break;
		default:
			break;
	}

	OnDevilFruitAbilityUsed();

	// Reset Devil Fruit state
	GetWorld()->GetTimerManager().SetTimer(FTimerHandle(), [this]()
	{
		bIsUsingDevilFruit = false;
	}, 3.0f, false);
}

void AOnePieceCharacter::UseHaki(EHakiType HakiType)
{
	if (!CanUseHaki(HakiType))
		return;

	bIsUsingHaki = true;

	UE_LOG(LogTemp, Warning, TEXT("%s activates %s!"), 
		*UEnum::GetValueAsString(CharacterType), *UEnum::GetValueAsString(HakiType));

	switch (HakiType)
	{
		case EHakiType::Observation:
			UE_LOG(LogTemp, Warning, TEXT("Observation Haki activated - Enhanced awareness!"));
			// Implement observation haki effects (enemy detection, etc.)
			break;
		case EHakiType::Armament:
			UE_LOG(LogTemp, Warning, TEXT("Armament Haki activated - Enhanced attack and defense!"));
			// Temporarily boost attack and defense
			AttackPower *= 1.5f;
			DefensePower *= 1.5f;
			break;
		case EHakiType::Conqueror:
			UE_LOG(LogTemp, Warning, TEXT("Conqueror's Haki activated - Stunning nearby enemies!"));
			// Implement area stun effect
			break;
		default:
			break;
	}

	OnHakiActivated(HakiType);

	// Reset Haki state and stats
	GetWorld()->GetTimerManager().SetTimer(FTimerHandle(), [this, HakiType]()
	{
		bIsUsingHaki = false;
		if (HakiType == EHakiType::Armament)
		{
			AttackPower /= 1.5f;
			DefensePower /= 1.5f;
		}
	}, 10.0f, false);
}

bool AOnePieceCharacter::CanUseHaki(EHakiType HakiType) const
{
	return AvailableHakiTypes.Contains(HakiType) && !bIsUsingHaki;
}