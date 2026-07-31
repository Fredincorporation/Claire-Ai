from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseTool(ABC):
    """
    Base class for tools executed by agents (e.g., social publishing, analytics fetching, graphic generation).
    """
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    @abstractmethod
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Execute tool functionality.
        """
        pass
